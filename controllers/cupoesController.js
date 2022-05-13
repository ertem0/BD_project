const express = require("express");
const jwt = require('jsonwebtoken');
const pool  = require("../connection")

module.exports = {
    createCampanha: async(req, res)=>{
        const description= req.body.description
        const start = req.body.date_start
        const end = req.body.date_end
        const stock = parseInt(req.body.cupons)
        const produto_id = parseInt(req.body.produto_id)
        const tokenheader = req.headers.authorization

        var id = 0
        tokeninfo = jwt.verify(tokenheader, '123456')
        try{
            await pool.query('BEGIN')
            let result =await pool.query('SELECT users_username FROM administrador where users_username = $1',[tokeninfo.username])
            if(result.rows[0] === undefined){
                return res.status(500).send()
            }

            result = await pool.query('SELECT MAX(campanha_id) FROM campanha') 
                
            if(result.rows[0].max === null){
                id = 1
            }
            else{
                id = 1 + parseInt(result.rows[0].max)
            }
            await pool.query('INSERT INTO campanha (campanha_id, inicio, fim, description, stock, produtos_produto_id, administrador_users_username) VALUES($1,$2,$3,$4,$5,$6,$7)',
                [id, start, end, description, stock, produto_id, tokeninfo.username])
            pool.query("COMMIT")
            return res.status(200).send({resultado: "campanha created"})
            
            }
        catch (e){
            pool.query('ROLLBACK')
            throw e
        }
        

        
    }
}