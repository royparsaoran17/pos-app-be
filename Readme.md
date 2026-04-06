cd pos-be
npm install
npx prisma migrate dev
npm run seed


cd pos-app-be
docker build -t pos-be .
docker run -p 9005:9005 \
  -e DATABASE_URL="mysql://root:root_password@host.docker.internal:3306/pos_omt_db" \
  -e JWT_SECRET="pos-app-secret-key-2024" \
  -e JWT_EXPIRATION=86400 \
  pos-be
