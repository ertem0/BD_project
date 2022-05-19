const express = require("express");
const jwt = require('jsonwebtoken');
const pool  = require("../connection")

//definir as funcoes (VIEWS)
module.exports = {
    create_question: async(req, res)=>{
        const prod_id = req.params.prod_id;
        const question = req.body.question;
        const autherization= req.headers.authorization;
        const user = jwt.verify(autherization, '123456').username
        console.log(prod_id, question, user)
        pool.query('INSERT INTO perguntas (produtos_produto_id, pergunta, users_username) VALUES ($1, $2, $3) RETURNING (pergunta_id)', [prod_id, question, user] , (error, result)=>{
                
                if (error) {
                    return res.status(500).json({err: error})
                }
                return res.status(200).json({status: 200, results: result.rows[0]["pergunta_id"]})
            })
    },

    create_response: async(req, res)=>{
        const prod_id = req.params.prod_id;
        const question_id = req.params.question_id;
        const response = req.body.question;
        const autherization= req.headers.authorization;
        const user = jwt.verify(autherization, '123456').username
        console.log(prod_id, question_id, response, user)
        pool.query('INSERT INTO respostas (perguntas_pergunta_id, resposta, users_username) VALUES ($1, $2, $3) RETURNING (resposta_id)', [question_id, response, user] , (error, result)=>{
                
            if (error) {
                return res.status(500).json({err: error})
            }
            return res.status(200).json({status: 200, results: result.rows[0]["resposta_id"]})
        })
    }
}
    
