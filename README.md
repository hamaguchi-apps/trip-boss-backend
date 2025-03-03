# WHAT??

This is a monorepo built with TurboRepo for the Trip Boss project, for more information about TurboRepo, please visit the [official website](https://turbo.build/repo).

## Build

To build all apps and packages, run the following command:

```bash
pnpm build
```

## Run Locally

To run all apps and packages locally, run the following command:

```bash
pnpm dev
```

## Testing

- Test all: ex: `turbo run test`
- Test only one app: ex: `turbo run test --filter=trip-boss-backend-functions`
- Test only one package: ex: `turbo run test --filter=@repo/validator-service`

## Creating a new package

Follow the instructions [here](https://turbo.build/repo/docs/crafting-your-repository/creating-an-internal-package).

## Architecture

We are using NestJS with a Vertical Slices Architecture approach for the backend.

> Features cannot be dependent on each other, so we are using shared libraries for code that is shared between features.
> We can also use NestJS CQRS commands and events to communicate between features, or even publishing events to NATS.

### References

- [https://www.milanjovanovic.tech/blog/vertical-slice-architecture](https://www.milanjovanovic.tech/blog/vertical-slice-architecture)
- [https://www.jimmybogard.com/vertical-slice-architecture/](https://www.jimmybogard.com/vertical-slice-architecture/)

<img src="https://www.milanjovanovic.tech/blogs/mnw_062/vertical_slice_architecture.png" alt="Vertical Slice Architecture" width="644" height="362"/>
