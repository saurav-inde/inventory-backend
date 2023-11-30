const productTable = `CREATE TABLE IF NOT EXISTS products (
    name VARCHAR(255) NOT NULL PRIMARY KEY,
    qtty INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    rating FLOAT DEFAULT 5.0
    );`;

const userTable = `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_vendor BOOLEAN DEFAULT false
    );`;

const ordersTable = `CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

module.exports = { userTable, productTable, ordersTable };
