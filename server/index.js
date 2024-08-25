const express = require('express');
const paypal = require('paypal-rest-sdk');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());

paypal.configure({
    mode:'sandbox',
    "client_id":process.env.CLIENT_ID,
    "client_secret":process.env.CLIENT_SECRET,
})

app.post('/payment',async(req,res)=>{
    try {
        let create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:8000/success",
                "cancel_url": "http://localhost:8000/failed"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "item",
                        "sku": "item",
                        "price": "1.00",
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": "1.00"
                },
                "description": "This is the payment description."
            }]
        };


        await paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                console.log("Create Payment Response");
                data = payment;
                res.json(data);

            }
        });
    } catch (error) {
        console.log(error)
    }
})

app.get('/success', async (req, res) => {

    try {

        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": "1.00"
                }
            }]
        }


        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log(error)
                return res.redirect("http://localhost:5173/failed");
            } else {
                console.log("Execute Payment Response");
                // console.log(payment);
                const response = JSON.stringify(payment);
                const parsedResponse = JSON.parse(response);

                const transactions = parsedResponse.transactions[0];

                console.log("transactions", transactions);

                return res.redirect("http://localhost:5173/success");
            }
        })


    } catch (error) {
        console.log(error);
    }

})


app.get('/failed', async (req, res) => {

    return res.redirect("http://localhost:5173/failed");
})

app.listen(8000,()=>{
    console.log('server is started at port no. 8000');
})