const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* ===== DATA ===== */
let users = {};
let products = [];
let withdrawals = [];

/* ===== ADMIN ===== */
const ADMIN_ID = "admin";

/* ===== USER ===== */
function getUser(id) {
    if (!users[id]) {
        users[id] = {
            id,
            nickname: null,
            balance: 0,
            isAdmin: id === ADMIN_ID
        };
    }
    return users[id];
}

/* ===== REGISTER / LOGIN ===== */
app.post("/login", (req, res) => {
    const user = getUser(req.body.userId);
    res.json(user);
});

/* ===== SET NICK ===== */
app.post("/set-nick", (req, res) => {
    const user = getUser(req.body.userId);

    if (user.nickname) return res.json({ error: "already set" });

    user.nickname = req.body.nickname;
    res.json(user);
});

/* ===== CREATE PRODUCT ===== */
app.post("/product", (req, res) => {
    const user = getUser(req.body.userId);

    const product = {
        id: products.length + 1,
        owner: user.id,
        title: req.body.title,
        price: Number(req.body.price)
    };

    products.push(product);
    res.json(product);
});

/* ===== GET PRODUCTS ===== */
app.get("/products", (req, res) => {
    res.json(products);
});

/* ===== BUY ===== */
app.post("/buy", (req, res) => {
    const buyer = getUser(req.body.userId);
    const product = products.find(p => p.id === req.body.productId);

    if (!product) return res.json({ error: "not found" });
    if (buyer.balance < product.price)
        return res.json({ error: "no money" });

    buyer.balance -= product.price;

    const seller = getUser(product.owner);
    seller.balance += product.price;

    res.json({ success: true });
});

/* ===== TOPUP ===== */
app.post("/topup", (req, res) => {
    const user = getUser(req.body.userId);
    user.balance += Number(req.body.amount);
    res.json(user);
});

/* ===== WITHDRAW ===== */
app.post("/withdraw", (req, res) => {
    const user = getUser(req.body.userId);

    if (user.balance < req.body.amount)
        return res.json({ error: "not enough balance" });

    if (req.body.amount < 100000)
        return res.json({ error: "min withdraw 100000" });

    user.balance -= req.body.amount;

    withdrawals.push({
        userId: user.id,
        amount: req.body.amount
    });

    res.json({ success: true });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
