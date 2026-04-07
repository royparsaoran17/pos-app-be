<p align="center">
  Pos APP
</p>

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode (run with PM2)
$ npm run build
$ pm2 start dist/main.js --name=dreesing-app-be
```

## Running Migratioj

```bash
# create new table
$ npx prisma migrate dev â€”-name=â€œnew tableâ€

# running migration
$ npx prisma format
$ npx prisma migrate dev
$ npx prisma generate
$ npx prisma migrate deploy


# running seeder
$ npx prisma db seed
```


