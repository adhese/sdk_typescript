# Releasing

Creating a new release of the project is process that is mostly automated using
[changesets](https://github.com/changesets/changesets).

## Generating a changeset
Everytime you change something in the code that is user-facing, you should create a changeset. This can be done by running:

```bash
npm run changeset
```

This will start the changeset wizard that will guide you through the process of creating a changeset.

> [!NOTE]
> Use semver versioning when creating a changeset. That means that you should only bump the major version when you make
> breaking changes, the minor version when you add new features, and the patch version when you make bug fixes.

When you have created a changeset, you can commit the changeset file to the repository.

## Publishing a release
When you push one or more changesets to the `main` branch, the CI pipeline will create a new PR with a overview of all
packages that will be published. When the PR is merged, the CI pipeline will publish the packages to `npm`
automatically. It will also create a new release on GitHub with the changelogs.

> [!NOTE]
> If you want to combine multiple changesets you can leave the PR open and push more changes with changesets to the
> `main` branch. The CI pipeline will update the PR with the new changesets.
