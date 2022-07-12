const express = require("express");
const db = require("../db");
const router = new express.Router();
const ExpressError = require("../expressError")
const slugify = require("slugify")

router.get("/", async (req, res, next) => {
    console.log(slugify("Apple Computer", {lower: true, replacement: ""}))
    try {
        const results = await db.query(`SELECT code, name, description FROM companies`);
        return res.status(200).json({ companies: results.rows });
    }
    catch (err) {
        return next (err)
    }
});

router.get("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        const results = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [code]);
        if (results.rows.length === 0) {
            return res.status(404).json({ message: `Company code ${code} does not exist.`})
        }
        return res.status(200).json({ company: results.rows[0] });
    }
    catch (err) {
        return next (err)
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const code = slugify(name, {lower: true, replacement: "", strict: true})
        const results = await db.query(
            'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description' , [code, name, description]);
        return res.status(201).json({ company: results.rows[0] })
    }
    catch (err) {
        return next (err)
    }
});


router.put("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description' , [code, name, description]);
        if (results.rows.length === 0) {
            return res.status(404).json({ message: `Company code ${code} does not exist.`})
        }
        return res.status(201).json({ company: results.rows[0] });
        }
    catch (err) {
        return next (err)
    }
});


router.delete("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        const results = await db.query('SELECT * FROM companies WHERE code=$1', [code]);
        if (results.rows.length === 0) {
            return res.status(404).json({ message: `No company exists with code of ${code}.`});
        }
        await db.query('DELETE FROM companies WHERE code = $1', [code]);
        return res.status(200).json({ message: "Company deleted!" });
    }
    catch (err) {
        return next (err)
    }
});

module.exports = router