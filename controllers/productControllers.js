const { query } = require("express");
const express = require("express");
const jwt = require('jsonwebtoken');
const pool = require("../connection")
const {Pool} = require("pg")

module.exports = {
    cart: async (req, res) => {
        const quantidade= req.body.quantidade
        const cart=req.body.cart
        const produto_id = req.body.produto_id
        var version
        try {
            await pool.query('BEGIN')
            console.log("started transaction")
            for (let i = 0; i < cart.length; i++) {
                let line
                line = await pool.query('select * from produtos where produto_id=$1'[produto_id])
                    
                    if(line.rows[0] === undefined){
                        return res.status(200).json({response: "produto nao existe"})  
                    }
                    
                    else{
                        line= await pool.query('select version from versao_produto where produto_id=$1'[produto_id])
                        if(line.rows[0] === undefined){
                            version = 1
                        }    
                        else{
                            version = line.rows[0].version +1
                        }    
                        await pool.query('insert into versao_podutos(nome,preco,stock,version,descricao,creation_date)')
                    }              

                await pool.query('update produtos set stock_produto = stock_produto - $1 where produto_id = $2;',[cart[i][1],cart[i][0]])
                line = await pool.query('select stock_produto from produtos where produto_id = $1',[cart[i][0]])

                if (line.rows[0].stock_produto < 0) {
                    throw new Error('Produto sem estoque')
                }

            }
            await pool.query('COMMIT')
          } catch (e) {
            await pool.query('ROLLBACK')
            console.log("traz")
            throw e
          } finally{
              return res.status(200).json({"status":"ok"})
          }
        
    },

    criar_novo_produto: async (req, res) => {
        const type = req.body.type
        const produto_id = req.body.produto_id
        const empresa_id= req.body.empresa_id
        const nome = req.body.nome
        const descricao = req.body.descricao
        const preco = req.body.preco
        const stock = req.body.stock
        const tokenheader = req.headers.authorization 
        
        tokeninfo = jwt.verify(tokenheader, '123456')
        let line
        try {
            line = await pool.query('SELECT users_username FROM vendedor WHERE users_username = $1',[tokeninfo.username])
        } catch (error) {
            line = error
        }
        if (line.rows[0] === undefined){
            return res.status(401).send()
        }
        console.log(line)        
        await pool.query('SELECT produto_id FROM produtos WHERE produto_id= $1 ', [produto_id], (error, result) => {
            if (error) {

                throw error
            }
            if (result.rows[0] !== undefined) {  
                return res.status(200).json({ response: "produto ja existente" })
            }
        
        if (type === "smartphone") {

            const marca = req.body.marca
            
            pool.query('INSERT INTO produtos (produto_id,nome,preco, descricao,stock_produto,empresas_empresa_id) VALUES ($1, $2, $3, $4,$5,$6)', [produto_id, nome, preco, descricao,stock,empresa_id], (error, result) => {
                if (error) {
                    throw error
                }
                pool.query('INSERT INTO smartphones(marca,produtos_produto_id) VALUES($1,$2)', [marca, produto_id], (error, result) => {
                    if (error) {
                        throw error
                    }
                    console.log("yeeee")
                    return res.status(200).json({ response: "produto criado" })
                })
            })
        }
        
        else if (type === "televisao") {
            console.log("here")
            const dimensao = req.body.dimensao
            pool.query('INSERT INTO produtos (produto_id,nome,preco, descricao,stock_produto,empresas_empresa_id) VALUES ($1, $2, $3, $4,$5,$6)', [produto_id, nome, preco, descricao,stock,empresa_id], (error, result) => {
                if (error) {
                    throw error
                }
                pool.query('INSERT INTO televisoes(dimensao,produtos_produto_id ) VALUES($1,$2)', [dimensao,produto_id], (error, result) => {
                    if (error) {
                        throw error
                    }

                    return res.status(200).json({ response: "produto criado" })
                })
            })
        }
        else if (type === "computador") {
            console.log("here2")
            const cpu = req.body.cpu
            pool.query('INSERT INTO produtos (produto_id,nome,preco, descricao,stock_produto,empresas_empresa_id) VALUES ($1, $2, $3, $4,$5,$6)', [produto_id, nome, preco, descricao,stock,empresa_id], (error, result) => {
                if (error) {
                    throw error
                }
                pool.query('INSERT INTO computadores(cpu,produtos_produto_id) VALUES($1,$2)', [cpu, produto_id], (error, result) => {
                    if (error) {
                        throw error
                    }
                    return res.status(200).send({ response: "produto criado" })
                })
            })
        console.log("here3")    
        }
        else{
            console.log("here4")
            return res.status(500).json({ response: "tipo de produto nao existe" })
        }
        
    })    
    },
}
