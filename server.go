package main

import (
	"log"

	cors "qanc/src/controllers/cors"
	conn "qanc/src/database/connection"
	loadenv "qanc/src/loadenv"
	routes "qanc/src/routes"

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

	routes.SetupAuthRoutes(app, conn.DB)
	routes.SetupQancRoutes(app, conn.DB)

	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}
