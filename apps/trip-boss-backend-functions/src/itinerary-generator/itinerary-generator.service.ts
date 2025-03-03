import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { ItineraryGeneratorConfig } from './config'
import { getConfig } from './config'
import { ConfigLoaderService } from '@repo/typed-config'

interface Flight {
  origin: string
  destination: string
  datetime: Date
  origin_airport_code: string
  destination_airport_code: string
  total_price: number
  total_duration: number
  flight_number: string
}

interface FlightResponse {
  departure: Flight
  arrival: Flight
}
interface LocationResponse {
  position: number
  title: string
  place_id: string
  data_id: string
  data_cid: string
  reviews_link: string
  photos_link: string
  gps_coordinates: {
    latitude: number
    longitude: number
  }
}

interface ItineraryResponse {
  start_datetime: string
  end_datetime: string
  location: LocationResponse
}

interface Coordinates {
  latitude: number
  longitude: number
}

@Injectable()
export class ItineraryGeneratorService {
  private config: ItineraryGeneratorConfig
  private readonly logger: Logger

  constructor(
    private readonly configLoader: ConfigLoaderService,
  ) {
    this.config = getConfig(this.configLoader)
    this.logger = new Logger(ItineraryGeneratorService.name, { timestamp: true })
  }

  // get flights for provided origin, destination, departure date and arrival date
  async getFlights(origin: string, destination: string, departureDate: string, arrivalDate: string): Promise<FlightResponse> {
    const params = {
      departure_id: origin,
      arrival_id: destination,
      outbound_date: departureDate,
      return_date: arrivalDate,
      type: '1',
      api_key: this.config.serpApiKey,
      engine: 'google_flights',
    }

    const response_departure = await axios.get('https://serpapi.com/search', {
      params,
    })

    this.logger.log({ message: 'getFlights', data: response_departure.data })

    const response_return = await axios.get('https://serpapi.com/search', {
      params: {
        ...params,
        departure_token: response_departure.data.best_flights[0].flights[0].departure_token,
      },
    })

    this.logger.log({ message: 'getFlights', data: response_return.data })

    // Get best outbound and return flights
    const bestOutbound = response_departure.data.best_flights[0].flights[0]
    const bestReturn = response_return.data.best_flights[0].flights[0]

    return {
      departure: {
        origin: bestOutbound.departure_airport.name,
        destination: bestOutbound.arrival_airport.name,
        datetime: new Date(bestOutbound.departure_airport.time),
        origin_airport_code: bestOutbound.departure_airport.id,
        destination_airport_code: bestOutbound.arrival_airport.id,
        total_price: bestOutbound.price,
        total_duration: bestOutbound.duration,
        flight_number: bestOutbound.flight_number,

      },
      arrival: {
        origin: bestReturn.departure_airport.name,
        destination: bestReturn.arrival_airport.name,
        datetime: new Date(bestReturn.departure_airport.time),
        origin_airport_code: bestReturn.departure_airport.id,
        destination_airport_code: bestReturn.arrival_airport.id,
        total_price: bestReturn.price,
        total_duration: bestReturn.duration,
        flight_number: bestReturn.flight_number,
      },
    }
  }

  async getAirportCoordinates(airport_code: string): Promise<Coordinates> {
    const query = encodeURIComponent(`${airport_code} airport`)
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?key=${this.config.geocodingApiKey}&address=${query}`,
    )

    this.logger.log({ message: 'getLocationsCoordinates', data: response.data })

    const location = response.data.results[0].geometry.location
    return {
      latitude: location.lat,
      longitude: location.lng,
    }
  }

  async getLocationsPossibilities(coordinates: Coordinates): Promise<LocationResponse[]> {
    // TODO: call locations serp api here
    const coordinates_query = encodeURIComponent(`@${coordinates.latitude},${coordinates.longitude},14z`)
    const query = encodeURIComponent('coffee shop, museum, restaurant')
    const response = await axios.get(`https://serpapi.com/search?api_key=${this.config.serpApiKey}&ll=${coordinates_query}&engine=google_maps&q=${query}`)
    this.logger.log({ message: 'getLocationsPossibilities', data: response.data })
    return response.data.local_results
  }

  async buildItinerary(flights: FlightResponse, locations: LocationResponse[]): Promise<ItineraryResponse[]> {
    const response = await axios.post('https://api.openai.com/v1/threads/runs', {
      assistant_id: this.config.openAiAssistantId,
      thread: {
        messages: [
          {
            role: 'user',
            content: `Flights: ${JSON.stringify(flights)}`,
          },
          {
            role: 'user',
            content: `Locations: ${JSON.stringify(locations)}`,
          },
          {
            role: 'user',
            content: 'Generate an itinerary',
          },
        ],
      },
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.openAiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
        'OpenAI-Organization': this.config.openAiOrgId,
        'OpenAI-Project': this.config.openAiProjectId,
      },
    })

    this.logger.log({ message: 'buildItinerary', data: response.data })

    // Wait for run to complete
    const runId = response.data.id
    const threadId = response.data.thread_id

    let runStatus = 'in_progress'
    while (runStatus === 'in_progress' || runStatus === 'queued') {
      const statusResponse = await axios.get(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.openAiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
          'OpenAI-Organization': this.config.openAiOrgId,
          'OpenAI-Project': this.config.openAiProjectId,
        },
      })

      runStatus = statusResponse.data.status
      if (runStatus === 'in_progress' || runStatus === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before checking again
      }
    }

    let messagesResponse

    if (runStatus === 'completed') {
      // Get the messages from the thread
      messagesResponse = await axios.get(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        headers: {
          'Authorization': `Bearer ${this.config.openAiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
          'OpenAI-Organization': this.config.openAiOrgId,
          'OpenAI-Project': this.config.openAiProjectId,
        },
      })

      this.logger.log({ message: 'buildItinerary messages', data: messagesResponse.data })
    }


    // Get the last message content
    const lastMessage = messagesResponse?.data?.data[0]
    let itineraryData = []

    if (lastMessage && lastMessage.content) {
      const messageContent = lastMessage.content[0]
      if (messageContent.type === 'text') {
        try {
          // Parse the JSON string from the message text
          itineraryData = JSON.parse(messageContent.text.value)
        }
        catch (error) {
          this.logger.error('Failed to parse itinerary JSON', error)
        }
      }
    }

    return itineraryData
  }

  async getItinerary(origin: string, destination: string, departureDate: string, arrivalDate: string): Promise<ItineraryResponse[]> {
    const flights = await this.getFlights(origin, destination, departureDate, arrivalDate)
    const coordinates = await this.getAirportCoordinates(flights.departure.destination_airport_code)
    const locations = await this.getLocationsPossibilities(coordinates)
    const itinerary = await this.buildItinerary(flights, locations)
    return itinerary
  }
}
