const express = require("express");
const jwt = require('jsonwebtoken');
const pool  = require("../connection")

//definir as funcoes (VIEWS)
module.exports = {
    login: async(req, res)=>{
        const nome = req.body.name;
        const pass = req.body.password;
        const user = {username: nome, password: pass}
        pool.query('SELECT username FROM users WHERE username = $1',[nome], (error, result)=>{
            if (error) {
                
                throw error
            }
            if(result.rows[0] === undefined){
                return res.status(200).json({response: "user nao registado"})
            }
        
            pool.query('SELECT password FROM users WHERE password = $1 AND username = $2',[pass, nome], (error, result)=>{
                if (error) {
            
                    throw error
                }
                if(result.rows[0] === undefined){
                    return res.status(200).json({response: "password incorreta"})
                }
                else{
                    const token = jwt.sign(user, process.env.ACCESS_TOKEN)
                    return res.status(200).json({response: "logged in", token: token})
                    
                }
            })
            
        })
    },


    register: async (req, res)=>{
        const type = req.body.type
        const nome = req.body.name
        const pass = req.body.password
        const user = {type: type, username: nome, password: pass}

        //gets the table where the username is
        await pool.query('SELECT username FROM users WHERE username = $1',[nome], async(error, result)=>{
            if (error) {
                
                throw error
            }
            
            //check if the return of the select query is empty
            if(result.rows[0] == undefined){
                
                //add user in the users table
                await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [nome, pass] , async(error, result)=>{

                    if (error) {
                        throw error
                    }

                    if(type === "comprador"){
                        // get the values for the comprador
                        const morada = req.body.morada
                        const cartao = req.body.cartao
                        const NIF = req.body.nif
                        
                        //add comprador in comprador table
                        await pool.query('INSERT INTO comprador (morada, cartao, users_username, nif) VALUES ($1, $2, $3, $4)',[morada,  cartao, nome,NIF], (error, result)=>{
    
                            if (error) {
                                throw error
                            }
                            
                            const accessToken = jwt.sign(user, '123456');
                            
                            return res.status(200).json({
                                response: "comprador added",
                                access_token: accessToken
                            })
                        });
    
                    }
                    //add a new vendedor to vendedor table
                    if(type === "vendedor"){
                        const morada = req.body.morada
                        const NIF = parseInt(req.body.nif) 
                        await pool.query('INSERT INTO vendedor (morada, users_username, nif) VALUES ($1, $2, $3)',[morada,  nome,NIF], (error, result)=>{
    
                            if (error) {
                                throw error
                            }
                            const accessToken = jwt.sign(user, '123456');
                            return res.status(200).json({
                                response: "vendedor added",
                                access_token: accessToken
                            })
                        });
                    }
                    //add a new 
                    if(type === "administrador"){
                        await pool.query('INSERT INTO administrador (users_username) VALUES ($1)',[nome], (error, result)=>{
    
                            if (error) {
                                throw error
                            }
                            const accessToken = jwt.sign(user, '123456');
                            return res.status(200).json({
                                response: "administrador added",
                                access_token: accessToken
                            })
                        });
                    }
                });

                

            }
            
            else{
                
                return res.status(200).json({resultado: "user already exists", user: result.rows[0].username})
            }
        })
        
    }
};

