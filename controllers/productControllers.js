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
                console.log("here1")
                line = await pool.query('select * from produtos where produto_id=$1',[cart[i][0]])
                console.log("here2")
                    if(line.rows[0] === undefined){
                        console.log("here3")
                        return res.status(200).json({response: "produto nao existe"})  
                    }
                    
                    else{
                        console.log("here4")
                        let line2= await pool.query('select version from versao_produto where produtos_produto_id=$1',[cart[i][0]])
                        console.log("here5")
                        console.log(line2.rows[0])
                        if(line2.rows[0] === undefined){
                            version = 1
                            console.log("here6")
                        }    
                        else{
                            console.log("here7")
                            version = 1 + parseInt(line2.rows[0]) 
                        }    
                        let date = new Date()
                        console.log("here8")
                        console.log(line.rows[0].nome,line.rows[0].preco,line.rows[0].stock_produto,version,line.rows[0].descricao,2,cart[i][0])
                        await pool.query('INSERT INTO versao_produto(nome,preco,stock,version,descricao,creation_date,produtos_produto_id) VALUES($1,$2,$3,$4,$5,$6,$7)',[line.rows[0].nome,line.rows[0].preco,line.rows[0].stock_produto,version,line.rows[0].descricao,2,cart[i][0]])
                        console.log("here9")
                    }              
                console.log("here9x") 
                await pool.query('update produtos set stock_produto = stock_produto - $1 where produto_id = $2;',[cart[i][1],cart[i][0]])
                console.log("here10")
                line = await pool.query('select stock_produto from produtos where produto_id = $1',[cart[i][0]])
                console.log("here11")
                
                if (line.rows[0].stock_produto < 0) {
                    throw new Error('Produto sem estoque')
                }

            }
            console.log("here12")
            await pool.query('COMMIT')
            console.log("here13")
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
        console.log(tokeninfo.username)
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
        try {      
            let result= await pool.query('SELECT produto_id FROM produtos WHERE produto_id= $1 ', [produto_id] )
         
            if (result.rows[0] !== undefined) {  
                return res.status(200).json({ response: "produto ja existente" })
            }
        } catch (error) {
            throw(error)
        }
        if (type === "smartphone") {
            try {
                const marca = req.body.marca
                if (marca === undefined) {
                    return res.status(200).json({ response: "marca nao definida" })
                }
                let result= await pool.query('INSERT INTO produtos (produto_id,nome,preco, descricao,stock_produto,empresas_empresa_id) VALUES ($1, $2, $3, $4,$5,$6)', [produto_id, nome, preco, descricao,stock,empresa_id])
                    
                await pool.query('INSERT INTO smartphones(marca,produtos_produto_id) VALUES($1,$2)', [marca, produto_id])
                        
                console.log("yeeee")
                return res.status(200).json({ response: "produto criado" })
                    
                
            } catch (error) {
                throw error
            }
            
        }
        else if (type === "televisao") {
            try{
                console.log("here")
                const dimensao = req.body.dimensao
                if (dimensao === undefined) {
                    return res.status(200).json({ response: "dimensao nao definida" })
                }
                let result=await pool.query('INSERT INTO produtos (produto_id,nome,preco, descricao,stock_produto,empresas_empresa_id) VALUES ($1, $2, $3, $4,$5,$6)', [produto_id, nome, preco, descricao,stock,empresa_id])
                   
                await pool.query('INSERT INTO televisoes(dimensao,produtos_produto_id ) VALUES($1,$2)', [dimensao,produto_id])
                return res.status(200).json({ response: "produto criado" })
                
            } catch (error) {
                throw error
            }
        }
        else if (type === "computador") {
            try{

            console.log("here2")
            const cpu = req.body.cpu
            if (cpu === undefined) {
                return res.status(200).json({ response: "cpu nao definida" })
            }
            let result= await pool.query('INSERT INTO produtos (produto_id,nome,preco, descricao,stock_produto,empresas_empresa_id) VALUES ($1, $2, $3, $4,$5,$6)', [produto_id, nome, preco, descricao,stock,empresa_id])
                
            await pool.query('INSERT INTO computadores(cpu,produtos_produto_id) VALUES($1,$2)', [cpu, produto_id])
                    
            return res.status(200).send({ response: "produto criado" })
             
            } catch (error) {
                throw error
            }
        }
        else{
           
            return res.status(500).json({ response: "tipo de produto nao existe" })
        }
        
    }   
    
}
