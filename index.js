const express = require('express');
const paypal = require('paypal-rest-sdk');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

paypal.configure({
    mode: 'sandbox',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
});

app.post('/payment', async (req, res) => {
    try {
        const { totalprice } = req.body;
        if (!totalprice) {
            return res.status(400).send({ error: "Total price is required" });
        }

        console.log(`Total price received: ${totalprice}`);

        // Update return_url to include totalprice as a query parameter
        let create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `https://paypal-v2bn.onrender.com/success?totalprice=${totalprice}`,
                "cancel_url": "https://paypal-v2bn.onrender.com/failed"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "item",
                        "sku": "item",
                        "price": totalprice.toString(),
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": totalprice.toString(),
                },
                "description": "This is the payment description."
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.error("Error creating payment:", error);
                return res.status(500).send({ error: "Payment creation failed" });
            } else {
                console.log("Create Payment Response", payment);
                res.json(payment);
            }
        });
    } catch (error) {
        console.error("Error in /payment route:", error);
        res.status(500).send({ error: "Server error" });
    }
});

app.get('/success', async (req, res) => {
    try {
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        const totalprice = req.query.totalprice;  // Retrieve totalprice from query parameters

        console.log(`Total price received on success: ${totalprice}`);

        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": totalprice  // Use the totalprice received
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.error("Error executing payment:", error);
                return res.redirect("https://e-commerce-website-orpin-nine.vercel.app/failed");
            } else {
                console.log("Execute Payment Response", payment);
                res.redirect("https://e-commerce-website-orpin-nine.vercel.app/success");
            }
        });
    } catch (error) {
        console.error("Error in /success route:", error);
        res.redirect("https://e-commerce-website-orpin-nine.vercel.app/failed");
    }
});

app.get('/failed', async (req, res) => {
    res.redirect("https://e-commerce-website-orpin-nine.vercel.app/failed");
});

app.listen(8004, () => {
    console.log('Server is started at port no. 8004');
});
