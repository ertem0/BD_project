const express = require("express");
const jwt = require('jsonwebtoken');
const pool  = require("../connection")

//definir as funcoes (VIEWS)
module.exports = {
    create_question: async(req, res)=>{
        const prod_id = req.body.prod_id;
        const question = req.body.question;
        const user= req.body.user;
        console.log(prod_id, question, user)
        pool.query('INSERT INTO perguntas (produtos_produto_id, pergunta, users_username) VALUES ($1, $2, $3)', [prod_id, question, user] , (error, result)=>{
                
                if (error) {
                    throw error
                }
                return res.status(200).json({response: "question created"})
            })
    }
}