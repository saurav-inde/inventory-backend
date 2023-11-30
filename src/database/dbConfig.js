const { userTable, productTable, ordersTable } = require("./tables");

const Client = require("pg").Client;

const databaseClient = {
  connectionString:
    "postgres://sk:GYVmmbhVvpG3UrwfLfcugVSOEejpsE8B@dpg-clh07vef27hc739nm1qg-a.ohio-postgres.render.com/inventory_db_1tas",
  user: "sk",
  password: "GYVmmbhVvpG3UrwfLfcugVSOEejpsE8B",
  port: 5432,
  database: "inventory_db_1tas",
  ssl: {
    rejectUnauthorized: false, // need to set this to true in a production environment with a valid certificate
  },
};

const client = new Client(databaseClient);

console.log(userTable);
client
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .then(async () => {
    try {
      client.query(userTable);
    } catch (error) {
      console.error("Error quering the users table:", error);
    }
  })
  .then(async () => {
    try {
      client.query(productTable);
    } catch (error) {
      console.error("Error quering the products table:", error);
    }
  })
  .catch((err) => console.error("Connection error", err.stack))
  .then(async () => {
    try {
      client.query(ordersTable);
    } catch (error) {
      console.error("Error quering the orders table:", error);
    }
  })
  .catch((err) => console.error("Connection error", err.stack));

async function addProduct(client, productData) {
  try {
    // Insert the new product into the products table
    await client.query(
      `
        INSERT INTO products (name, qtty, price, rating)
        VALUES ($1, $2, $3, $4)
      `,
      [
        productData.name,
        productData.qtty,
        productData.price,
        productData.rating,
      ]
    );

    console.log("Product inserted successfully");
  } catch (error) {
    console.error("Error inserting product:", error);
  }
}

const addOrderToTable = async (req, res) => {
  // console.log(req.body);
  const { orders, user_email } = req.body;

  try {
    await client.query("BEGIN");

    for (const order of orders) {
      // console.log(order.name, order.quantity, user_email);
      await client.query(
        `
        INSERT INTO orders (product_name, quantity, user_email)
        VALUES ($1, $2, $3)
      `,
        [order.name, order.quantity, user_email]
      );
    }
    await client.query("COMMIT");
    // console.log(user_email);
    await console.log("________________");
    console.log( (await client.query("SELECT * FROM orders")).rows);
    await console.log("________________");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding order to the database:", error);
  }
};

module.exports = { client, addProduct, addOrderToTable };
