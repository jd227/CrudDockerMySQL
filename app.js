import express from "express";
import mysql from "mysql2/promise";

const app = express();
const port = 3000;
async function startServer() {
    let connection;
    let retries = 5;
    // se crea la coneccion a la base de datos y se realiza los intentos ya que la conexion no funciona de la misma manera
    while (retries) {
        try {
            connection = await mysql.createConnection({
                host: 'mysql_db', 
                port: 3306,     
                user: 'root',
                password: '12345',
                database: 'miapp'
            });
            break; // Salir del bucle si la conexión es exitosa
        } catch (error) {
            console.error('Error conectando a MySQL, reintentando...', error);
            retries -= 1;
            await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos antes de reintentar
        }
    }

    if (!connection) {
        console.error('No se pudo conectar a MySQL después de varios intentos.');
        process.exit(1); 
    }

    // Crear tabla si no existe

    await connection.query(`CREATE TABLE IF NOT EXISTS personas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        edad INT NOT NULL,
        ciudad VARCHAR(255) NOT NULL
    )`);

    // Rutas para el consumo de la api

    app.get("/", async (req, res) => {
        try {
            const [rows] = await connection.query("SELECT * FROM personas");
            res.json(rows);
        } catch (error) {
            res.status(500).send("Error al consultar la base de datos.");
            console.error(error);
        }
    });

    // ruta para agregar persona: http://localhost:3000/agregar?nombre=juan&edad=25&ciudad=Medellin

    app.get("/agregar", async (req, res) => {
        try {
            const { nombre, edad, ciudad } = req.query;
            await connection.query("INSERT INTO personas (nombre, edad, ciudad) VALUES (?, ?, ?)", [nombre, edad, ciudad]);
            res.send("Persona agregada");
        } catch (error) {
            res.status(500).send("Error al agregar persona.");
            console.error(error);
        }
    });

    // ruta para actualizar un dato

    app.get("/actualizar", async (req, res) => {
        try {
            const { id, nombre, edad, ciudad } = req.query;
            await connection.query("UPDATE personas SET nombre = ?, edad = ?, ciudad = ? WHERE id = ?", [nombre, edad, ciudad, id]);
            res.send("Persona actualizada");
        } catch (error) {
            res.status(500).send("Error al actualizar persona.");
            console.error(error);
        }
    });

    // ruta para borra

    app.get("/borrar", async (req, res) => {
        try {
            const { id } = req.query;
            await connection.query("DELETE FROM personas WHERE id = ?", [id]);
            res.send("Persona borrada");
        } catch (error) {
            res.status(500).send("Error al borrar persona.");
            console.error(error);
        }
    });

    // configuracion de puerto

    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
}

startServer();