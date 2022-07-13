const express = require("express");
const db = require("../db");
const router = new express.Router();
const ExpressError = require("../expressError")

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, industry FROM industries`);
        return res.status(200).json({ industries: results.rows });
    }
    catch (err) {
        return next (err)
    }
});


router.post("/", async (req, res, next) => {
    try {
        const { code, industry } = req.body;
        const results = await db.query(
            'INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry' , [code, industry]);
        return res.status(201).json({ industry: results.rows[0] })
    }
    catch (err) {
        return next (err)
    }
});


router.get("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        const results = await db.query(`SELECT i.industry, c.name FROM industries AS i LEFT JOIN connections ON i.code = connections.industry_code LEFT JOIN companies as c ON c.code = connections.company_code WHERE i.code = $1`, [code]);

        if (results.rows.length === 0) {
            return res.status(404).json({ message: `Industry code ${code} does not exist.`})
        }
        const names = results.rows.map(r => r.name);
        return res.status(200).json({ "companies in industry" : names })
    }
    catch (err) {
        return next (err)
    }
});

module.exports = router;