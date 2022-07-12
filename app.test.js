process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("./app");
const db = require("./db");

let testCompany;
let testInvoice;

beforeEach(async () => {
    let companyResult = await db.query(
        `INSERT INTO companies
        (code, name, description)
        VALUES ('GGL', 'Google', 'We own the world')
        RETURNING code, name, description`);
    testCompany = companyResult.rows[0];

    let invoiceResult = await db.query(
        `INSERT INTO invoices
        (comp_code, amt, paid, add_date, paid_date)
        VALUES ('GGL', 500, DEFAULT, DEFAULT, DEFAULT)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`);
    testInvoice = invoiceResult.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
    await db.end();
});

describe("GET /companies", () => {
    test("Gets list of all companies", async () => {
        const response = await request(app).get(`/companies`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ companies: [ testCompany ]});
    })
});


describe("GET /companies/:code", () => {
    test("Get information for one company", async () => {
        const response = await request(app).get(`/companies/${testCompany.code}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ company: testCompany });
    });
    test("Returns a 404 if company does not exist", async () => {
        const response = await request(app).get(`/companies/fakeCompany`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({message: "Company code fakeCompany does not exist."});
    });
});


describe("POST /companies", () => {
    test("Create a new company", async () => {
        const response = await request(app).post(`/companies`).send({ code:'FB', name:'Facebook', description:'We want you to like us so bad!' });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ company: { code:'FB', name:'Facebook', description:'We want you to like us so bad!' }})
    });
});


describe("PUT /companies/:code", () => {
    test("Edit a company", async () => {
        const response = await request(app).put(`/companies/${testCompany.code}`).send({ name:'New Company Name', description:'We changed our description' });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ company: { code:'GGL', name:'New Company Name', description:'We changed our description' }});
    });
    test("Returns a 404 if company does not exist", async () => {
        const response = await request(app).put(`/companies/fakeCompany`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({message: "Company code fakeCompany does not exist."});
    });
});

describe("DELETE /companies/:code", () => {
    test("Delete a company", async () => {
        const response = await request(app).delete(`/companies/${testCompany.code}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Company deleted!"});
    });
    test("Returns a 404 if company does not exist", async () => {
        const response = await request(app).delete(`/companies/fakeCompany`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({message: `No company exists with code of fakeCompany.`});
    });
});

describe("GET /invoices", () => {
    test("Gets list of all invoices", async () => {
        const response = await request(app).get(`/invoices`);
        expect(response.statusCode).toBe(200);
        expect(response.body.invoices.length).toEqual(1);
    })
});

describe("GET /invoices/:id", () => {
    test("Get details for one invoice", async () => {
        const response = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(response.statusCode).toBe(200);

        // This gave the same data but date was a string in the response body:
                // expect(response.body).toEqual({ invoice: { testInvoice }});
        // So I wrote this instead:
        expect(response.body).toEqual({ invoice: { id: expect.any(Number), comp_code: "GGL", amt: 500, paid: false, add_date: expect.any(String), paid_date: null }})

    });
    test("Returns a 404 if invoice does not exist", async () => {
        const response = await request(app).get(`/invoices/99`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({message: "No invoice exists with id of 99."});
    });
});


describe("POST /invoices", () => {
    test("Create a new invoice", async () => {
        const response = await request(app).post(`/invoices`).send({ comp_code: 'GGL', amt: 389 });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ invoice: { id: expect.any(Number), comp_code: "GGL", amt: 389, paid: false, add_date: expect.any(String), paid_date: null }})
    });
});


describe("PUT /invoices/:id", () => {
    test("Edit an invoice", async () => {
        const response = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt: 473 });
        expect(response.statusCode).toBe(201);
        expect(response.body.invoice.amt).toEqual(473);
    });
    test("Returns a 404 if invoice does not exist", async () => {
        const response = await request(app).put(`/invoices/555`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({message: `No invoices exists with id of 555.`});
    });
});


describe("DELETE /invoices/:id", () => {
    test("Delete an invoice", async () => {
        const response = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: "deleted"});
    });
    test("Returns a 404 if invoice does not exist", async () => {
        const response = await request(app).delete(`/invoices/99`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: `No invoice exists with id of 99.`});
    });
});