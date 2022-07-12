const express = require("express");
const app = require("../app");
const db = require("../db");
const router = new express.Router();
const ExpressError = require("../expressError")

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query('SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices');
        return res.status(200).json({ invoices: results.rows });
    }
    catch (err) {
        return next (err);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const results = await db.query('SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE id=$1', [id]);
        if (results.rows.length === 0) {
            return res.status(404).json({ message: `No invoice exists with id of ${id}.`});
        }
        return res.status(200).json({ invoice: results.rows[0] })
    }
    catch (err) {
        return next (err);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
        return res.status(201).json({ invoice: results.rows[0] })
    }
    catch (err) {
        return next (err);
    }
});



router.put("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const { amt } = req.body;
        const results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id]);
        if (results.rows.length === 0) {
            return res.status(404).json({ message: `No invoices exists with id of ${id}.`});
        }
        return res.status(201).json({ invoice: results.rows[0] })
    }
    catch (err) {
        return next (err);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const results = await db.query('SELECT * FROM invoices WHERE id=$1', [id]);
        if (results.rows.length === 0) {
            return res.status(404).json({ message: `No invoice exists with id of ${id}.`});
        }
        await db.query('DELETE FROM invoices WHERE id=$1', [id]);
        return res.json({ status: "deleted"})
    }
    catch (err) {
        return next (err);
    }
})

module.exports = router