const { query } = require("express");
const express = require("express");
const jwt = require('jsonwebtoken');
const pool  = require("../connection");
const productControllers = require("./productControllers");

//definir as funcoes (VIEWS)
module.exports = {
    login: async(req, res)=>{
        const nome = req.body.username;
        const pass = req.body.password;
        const user = {username: nome, password: pass}
        
        try{
            await pool.query("BEGIN")
                
            let result = await pool.query('SELECT password FROM users WHERE password = $1 AND username = $2',[pass, nome])
                
                if(result.rows[0] === undefined){
                    return res.status(200).json({response: "password incorreta ou user nao existe"})
                }
                
                const token = jwt.sign(user, '123456')
                await pool.query('COMMIT')
                return res.status(200).json({response: "logged in", token: token})    
        }catch(e){
            await pool.query('ROLLBACK')
            throw e
        }
        
    },

    register: async (req, res)=>{
        const type = req.body.type
        const nome = req.body.username
        const pass = req.body.password
        const email = req.body.email
        const tokenheader = req.headers.authorization  
        //supostamente devia decodificar o token mas nao funciona
        let tokeninfo = {username:undefined}
        if (tokenheader !== undefined){
        tokeninfo = jwt.verify(tokenheader, '123456')
        
        }
        try{

            await pool.query("BEGIN")
            let result = await pool.query('SELECT users_username FROM administrador WHERE users_username = $1',[tokeninfo.username])
                
            if(result.rows[0] === undefined && (type === "administrador" || type === "vendedor")){
                
                return res.status(500).send()
                
            }
            
            
            //gets the table where the username is
            result = await pool.query('SELECT username FROM users WHERE username = $1',[nome])
                
                
                //check if the return of the select query is empty
            if(result.rows[0] == undefined){
                
                //add user in the users table
                await pool.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3)', [nome, pass, email])

                    

                if(type === "comprador"){
                    // get the values for the comprador
                    const morada = req.body.morada
                    const cartao = req.body.cartao
                    const NIF = req.body.nif
                    
                    //add comprador in comprador table
                    await pool.query('INSERT INTO comprador (morada, cartao, users_username, nif) VALUES ($1, $2, $3, $4)',[morada,  cartao, nome,NIF])

                    await pool.query('COMMIT')
                    return res.status(200).json({
                        response: "comprador added",
                        
                    })

                }
                
                //add a new vendedor to vendedor table
                if(type === "vendedor"){
                    const morada = req.body.morada
                    const NIF = parseInt(req.body.nif) 


                    await pool.query('INSERT INTO vendedor (morada, users_username, nif) VALUES ($1, $2, $3)',[morada,  nome,NIF])

                    await pool.query('COMMIT')
                    return res.status(200).json({
                        response: "vendedor added",
                        
                    })
                    
                }
                //add a new 
                if(type === "administrador"){
                    await pool.query('INSERT INTO administrador (users_username) VALUES ($1)',[nome])
                    await pool.query('COMMIT')
                    return res.status(200).json({
                        response: "administrador added",
                        
                    })
                
                }

                
                else{
                    
                    return res.status(200).json({resultado: "user already exists", user: result.rows[0].username})
                }
                
                
            }
        }catch(e){
            await pool.query('ROLLBACK')
            throw e
        }
        
                
    }
};

