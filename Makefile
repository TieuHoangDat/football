.PHONY: start-backend

start-backend:
	cd backend && npm start

.PHONY: start-frontend

start-frontend:
	cd frontend && npx expo start --tunnel