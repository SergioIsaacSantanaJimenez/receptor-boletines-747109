# Receptor de Boletines

Este proyecto es un servicio backend desarrollado con Node.js y TypeScript utilizando el framework Express.js. Su función principal es actuar como un "receptor" o "mostrador" para boletines informativos. Permite a los usuarios acceder a boletines específicos mediante un ID de boletín y un correo electrónico asociado. El servicio valida la autorización del usuario contra los datos almacenados en una tabla de AWS DynamoDB, marca el boletín como leído y luego renderiza una página HTML que muestra el contenido del boletín, así como un enlace y una imagen de un archivo externo (presumiblemente almacenado en S3).

## Tecnologías

*   **Node.js**: v20
*   **TypeScript**: v5.8.3
*   **Express.js**: v4.21.2
*   **AWS SDK**: v3.782.0 (para `client-dynamodb` y `lib-dynamodb`)
*   **Docker**: Para contenerización

## Prerrequisitos

Antes de ejecutar el proyecto, asegúrate de tener lo siguiente:

*   **Node.js** (v20 o superior) y **npm**.
*   Acceso a una tabla de **AWS DynamoDB** configurada para almacenar los datos de los boletines. La tabla debe contener al menos los atributos `boletinID` (clave primaria), `correoElectronico`, `archivoUrl` y `contenido`.
*   Credenciales de **AWS** configuradas (vía variables de entorno o configuración por defecto para la región especificada).
*   Las siguientes **variables de entorno** deben estar definidas:
    *   `DYNAMO_TABLE`: El nombre de la tabla de DynamoDB (obligatorio).
    *   `AWS_REGION`: La región de AWS donde se encuentra la tabla de DynamoDB (opcional, por defecto `us-east-1`).
    *   `PORT`: El puerto en el que el servidor Express escuchará (opcional, por defecto `8081`).
*   **Docker** (opcional, para despliegue en contenedores).

## Instalación

1.  Clona este repositorio:
    ```bash
    git clone https://github.com/SergioIsaacSantanaJimenez/receptor-boletines-747109.git
    cd receptor-boletines-747109
    ```
2.  Instala las dependencias del proyecto:
    ```bash
    npm install
    ```

## Ejecución

### Localmente (sin Docker)

1.  Compila el código TypeScript:
    ```bash
    npm run build
    ```
2.  Ejecuta la aplicación, asegurándote de definir las variables de entorno necesarias:
    ```bash
    DYNAMO_TABLE=nombre-de-tu-tabla-dynamodb AWS_REGION=tu-region-aws npm start
    # Ejemplo:
    # DYNAMO_TABLE=MyBoletinesTable AWS_REGION=us-east-1 npm start
    ```

### Con Docker

1.  Construye la imagen Docker desde el directorio raíz del proyecto:
    ```bash
    docker build -t receptor-boletines . 
    ```
2.  Ejecuta el contenedor, pasando las variables de entorno necesarias:
    ```bash
    docker run -p 8081:8081 \
      -e DYNAMO_TABLE=nombre-de-tu-tabla-dynamodb \
      -e AWS_REGION=tu-region-aws \
      receptor-boletines
    # Ejemplo:
    # docker run -p 8081:8081 -e DYNAMO_TABLE=MyBoletinesTable -e AWS_REGION=us-east-1 receptor-boletines
    ```

La aplicación estará disponible en `http://localhost:8081` (o el puerto configurado).

### Endpoint

Para consultar un boletín, utiliza la siguiente ruta:

`GET /boletines/:boletinID?correoElectronico=tu@email.com`

*   `boletinID`: El ID único del boletín.
*   `correoElectronico`: El correo electrónico asociado al boletín para validación.

## Estructura del Proyecto

*   `src/index.ts`: Contiene la lógica principal de la aplicación Express.js, incluyendo la definición del endpoint `/boletines/:boletinID`, la integración con AWS DynamoDB para la consulta y actualización de datos, y la generación dinámica de HTML.
*   `package.json`: Archivo de configuración que define los metadatos del proyecto, scripts de construcción y ejecución, y todas las dependencias.
*   `Dockerfile`: Define los pasos para construir la imagen Docker de la aplicación, incluyendo la copia del código compilado y la configuración del entorno de ejecución.
*   `dist/`: Directorio donde se almacenan los archivos JavaScript compilados de TypeScript, listos para ser ejecutados por Node.js.

## Habilidades Técnicas Demostradas

Este proyecto demuestra las siguientes habilidades técnicas:

*   **Desarrollo de APIs RESTful**: Implementación de un endpoint HTTP (`GET /boletines/:boletinID`) utilizando Node.js y Express.js.
*   **TypeScript**: Uso de TypeScript para un código robusto, escalable y con tipado estático.
*   **Integración con Servicios de AWS**: Conexión y operaciones con AWS DynamoDB utilizando el AWS SDK (v3) para `GetCommand` y `UpdateCommand`.
*   **Gestión de Datos NoSQL**: Manejo de lectura y actualización de ítems en una base de datos NoSQL como DynamoDB.
*   **Configuración y Gestión de Entorno**: Uso de variables de entorno (`process.env`) para configurar parámetros críticos de la aplicación (puerto, región AWS, nombre de tabla DynamoDB).
*   **Logging Estructurado**: Implementación de una función de logging (`log`) para generar mensajes estructurados en formato JSON.
*   **Manejo de Errores**: Captura de excepciones y retorno de respuestas HTTP apropiadas (400 Bad Request, 403 Forbidden, 404 Not Found, 500 Internal Server Error).
*   **Containerización de Aplicaciones**: Creación de un `Dockerfile` para empaquetar la aplicación en un contenedor Docker, facilitando su despliegue y portabilidad.
*   **Gestión del Ciclo de Vida del Servidor**: Implementación de un mecanismo de apagado elegante (graceful shutdown) para manejar las señales `SIGTERM` y `SIGINT`, asegurando un cierre limpio del servidor.