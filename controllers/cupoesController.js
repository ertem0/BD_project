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
        tokeninfo = jwt.verify(tokenheader, '123456')
        
        await pool.query('SELECT users_username FROM administrador where users_username = $1',[tokeninfo.username], async(error, result)=>{
            if(error){
                throw error
            }
            if(result.rows[0] === undefined){
                return res.status(500).send()
            }
        })

        await pool.query('SELECT MAX(campanha_id) FROM campanha', async(error, result)=>{
            if(error){
                throw error
            }

            if(result.rows[0].max === null){
                const id = 1
            }
            else{
                const id = result.rows[0].max + 1
            }
            pool.query('SELECT ')
            
            return res.status(200).send()    
        });



        
    }
}