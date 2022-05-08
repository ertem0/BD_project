const express = require("express");
const jwt = require('jsonwebtoken');

//definir as funcoes (VIEWS)
module.exports = {
    login: async(req, res, next)=>{
        return res.status(200).send()
    },
    register: async(req, res, next)=>{
        return res.status(200).send()
    }
};

