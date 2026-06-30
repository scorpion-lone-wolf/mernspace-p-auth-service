# Auth Service Notes

## TypeORM Migrations

Migrations are versioned database changes. In this project, entity changes are converted into migration files under:

```txt
src/migrations/
```

The datasource used by TypeORM CLI is:

```txt
src/config/dataSource.ts
```

Important config:

```ts
synchronize: Config.NODE_ENV == "test",
migrationsRun: false
```

Meaning:

- In `test`, TypeORM can synchronize tables automatically.
- In development/production, use migrations instead of `synchronize`.
- `migrationsRun: false` means migrations do not run automatically when the app starts.

## NPM Scripts

The project already has these scripts in `package.json`:

```json
{
  "migration:generate": "typeorm-ts-node-commonjs migration:generate",
  "migration:run": "typeorm-ts-node-commonjs migration:run"
}
```

## Generate A Migration

Use this after changing an entity, for example after adding a new column to `User` or `RefreshToken`.

```bash
npm run migration:generate -- src/migrations/migration -d src/config/dataSource.ts
```

What this means:

- `src/migrations/migration` is the output path/name prefix.
- TypeORM will create a timestamped file like `1782843834330-migration.ts`.
- `-d src/config/dataSource.ts` tells TypeORM which database config to use.

Direct command without npm script:

```bash
npx typeorm-ts-node-commonjs migration:generate src/migrations/migration -d src/config/dataSource.ts
```

## Run Migrations

Run pending migrations against the configured database:

```bash
npm run migration:run -- -d src/config/dataSource.ts
```

Direct command without npm script:

```bash
npx typeorm-ts-node-commonjs migration:run -d src/config/dataSource.ts
```

## Migration Workflow

1. Change an entity in `src/entities`.
2. Generate a migration:

```bash
npm run migration:generate -- src/migrations/migration -d src/config/dataSource.ts
```

3. Open the generated migration and read the `up()` and `down()` queries.
4. Run the migration:

```bash
npm run migration:run -- -d src/config/dataSource.ts
```

## Notes

- Do not use `synchronize: true` in production.
- Always review generated migration files before running them.
- `up()` applies the database change.
- `down()` reverts the database change.
- Keep migration files committed to git so every environment can apply the same database history.
