const express = require("express");
const jwt = require('jsonwebtoken');
const pool  = require("../connection")

//definir as funcoes (VIEWS)
module.exports = {
    login: async(req, res)=>{
        const nome = req.body.name;
        const pass = req.body.password;

        return res.status(200).json({nome: nome, password: pass})
    },


    register: async(req, res)=>{
        const type = req.body.type
        const nome = req.body.name
        const pass = req.body.password
        

        //gets the table where the username is
        pool.query('SELECT username FROM users WHERE username = $1',[nome], (error, result)=>{
            if (error) {
                
                throw error
            }
            
            //check if the return of the select query is empty
            if(result.rows[0] == undefined){
                
                //add user in the users table
                pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [nome, pass] , (error, result)=>{

                    if (error) {
                        throw error
                    }

                });

                if(type === "comprador"){
                    // get the values for the comprador
                    const morada = req.body.morada
                    const cartao = req.body.cartao
                    const NIF = parseInt(req.body.NIF)
                    //add comprador in comprador table
                    pool.query('INSERT INTO comprador (morada, cartao, users_username, nif) VALUES ($1, $2, $3, $4)',[morada,  cartao, nome,NIF], (error, result)=>{

                        if (error) {
                            throw error
                        }

                        return res.status(200).json({
                            response: "comprador added"
                        })
                    });

                }
                //add a new vendedor to vendedor table
                if(type === "vendedor"){
                    const morada = req.body.morada
                    const NIF = parseInt(req.body.NIF) 
                    pool.query('INSERT INTO vendedor (morada, users_username, nif) VALUES ($1, $2, $3)',[morada,  nome,NIF], (error, result)=>{

                        if (error) {
                            throw error
                        }

                        return res.status(200).json({
                            response: "administrador added"
                        })
                    });
                }
                //add a new 
                if(type === "administrador"){
                    pool.query('INSERT INTO administrador (users_username) VALUES ($1)',[nome], (error, result)=>{

                        if (error) {
                            throw error
                        }

                        return res.status(200).json({
                            response: "administrador added"
                        })
                    });
                }

            }
            
            else{
                
                return res.status(200).json({resultado: "user already exists", user: result.rows[0].username})
            }
        })
        
    }
};

