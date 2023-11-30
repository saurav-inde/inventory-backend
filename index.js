const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  client,
  addProduct,
  addOrderToTable,
} = require("./src/database/dbConfig");
const app = express();
const url = "0.0.0.0";
const port = process.env.PORT || 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Endpoints for signup and sign in
 */


app.post("/signup", async (req, res) => {
  console.log("Request Body:", req.body); 
  const { email, password, isVendor } = req.body;
  console.log(email, password, isVendor);

 
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(hashedPassword, isVendor);
  try {
    await client.query(
      "INSERT INTO users (email, password, is_vendor) VALUES ($1, $2, $3)",
      [email, hashedPassword, isVendor]
    );
    res.send("User registered successfully!");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user");
  }
});

app.post("/signin", async (req, res) => {
  const { email, password, isVendor } = req.body;
  console.log(email, password, isVendor);

  try {
    // Finding user by email in PostgreSQL
    const result = await client.query(
      // further vendor check can be added to allow both user and vendor to login
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    console.log(user.email, user.is_vendor, user.id);

    // If user not found or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create and sign a JWT token
    const token = jwt.sign(
      { userId: user.id, isVendor: user.is_vendor },
      "your-secret-key",
      { expiresIn: "1h" }
    );
    // Return the token
    res.json({
      token,
      email: user.email,
      isVendor: user.is_vendor,
      id: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * End point to add new products to the database table products
 */
app.post("/add_products", async (req, res) => {
  const productData = req.body;
  if (
    !productData.name ||
    !productData.qtty ||
    !productData.price ||
    !productData.rating
  ) {
    return res.status(400).json({ message: "Invalid product data" });
  }
  try {
    // Call the function to add a new product
    await addProduct(client, productData);
    console.log(client.query("SELECT * FROM products"));

    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
  // await client.end();
});

/**
 * Endpoint to get all products from the database table products
 */

// Endpoint to fetch all products
app.get("/get_products", async (req, res) => {
  try {

    // Retrieve all products from the products table
    const result = await client.query("SELECT * FROM products");
    console.log(result.rows);

    // Respond with the retrieved products
    res.status(200).json(result.rows);
  } catch (error) {
    // Respond with an error message
    res.status(500).json({ message: "Internal server error" });
  } finally {
  }
});

/**
 * Endpoint to add item in a cart
 */
// Add item to the cart
app.post("/api/cart/add", async (req, res) => {
  const { userId, productName, quantity, price } = req.body;

  try {
    await client.query(
      `
          INSERT INTO cart (user_id, product_name, quantity, price)
          VALUES ($1, $2, $3, $4)
      `,
      [userId, productName, quantity, price]
    );

    res.status(201).json({ message: "Item added to the cart successfully" });
  } catch (error) {
    console.error("Error adding item to the cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
/**
 * Endpoint to get all items in a cart
 
 */
// Get user's cart
app.get("/api/cart/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await client.query(
      `
          SELECT * FROM cart WHERE user_id = $1
      `,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * endpoint to add order to database
 */
// Add the /store_order route
app.post("/store_order", async (req, res) => {
  try {

    await addOrderToTable(req, res);

    res.json({ message: "Order details stored successfully" });
  } catch (error) {
    console.error("Error storing order details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * endpoint to get all orders from database
 */
app.get("/get_orders", async (req, res) => {
  try {
    // Query to select all rows from the orders table
    const result = await client.query("SELECT * FROM orders");

    // Extract the rows from the result
    const orders = result.rows;
    console.log(orders)

    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Remove all the orders
 */

app.post("/clear_orders", async (req, res) => {
  try {
    await client.query("DELETE * FROM orders");
    res.json({ message: "All orders cleared successfully" });
  } catch (error) {
    console.error("Error clearing orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 *  Starting the server
 *
 */

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, url, () => {
  console.log(`Server running at ${url}:${port}`);
});
