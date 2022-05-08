const express = require("express");
const jwt = require('jsonwebtoken');


//definir as funcoes (VIEWS)
module.exports = {
    login: async(req, res, next)=>{
        const nome = req.body.name;
        const pass = req.body.password;

        return res.status(200).json({nome: nome, password: pass})
    },
    register: async(req, res, next)=>{
        return res.status(200).send()
    }
};

