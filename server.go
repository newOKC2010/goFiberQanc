package main

import (
	"log"

	cors "qanc/src/controllers/cors"
	conn "qanc/src/database/connection"
	loadenv "qanc/src/loadenv"

	"github.com/gofiber/fiber/v2"
)

func main() {
	port := loadenv.LoadPort()
	if port == "" {
		log.Fatal("PORT is not set")
	}

	conn.ConnectDB()

	app := fiber.New()
	cors.CorsConfig(app)

	log.Printf("Server started on port: %s", port)

	// routes.SetupProviderRoutes(app)
	// routes.SetupAuthRoutes(app, conn.DB)
	// routes.SetupUserRoutes(app, conn.DB)
	// routes.SetupLabRoutes(app, conn.DB)

	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}
