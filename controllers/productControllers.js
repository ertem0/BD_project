const { query } = require("express");
const express = require("express");
const jwt = require('jsonwebtoken');
const pool = require("../connection")
const {Pool} = require("pg");
const { database } = require("../credentials");

module.exports = {
    cart: async (req, res) => {
        
        const quantidade= req.body.quantidade
        const cart=req.body.cart
        const produto_id = req.body.produto_id
        const cupao_id = parseInt(req.body.cupao_id)
        var version
        const tokenheader = req.headers.authorization 
        
        tokeninfo = jwt.verify(tokenheader, '123456')
        console.log(tokeninfo.username)
        let line

        //procura o nome do user do token na tabela de compradores para ver se é um comprador
        try {
            line = await pool.query('SELECT users_username FROM comprador WHERE users_username = $1',[tokeninfo.username])
            
        } catch (error) {
            throw(error)
        }
        if (line.rows[0] === undefined){
            return res.status(401).json({response: "nao autorizado"})
        }
        
        
        try {
            await pool.query('BEGIN')
            
            for (let i = 0; i < cart.length; i++) {
                let line
                let preco_total

                //vai buscar o stock de um certo produto
                line = await pool.query('select stock_produto from produtos where produto_id = $1',[cart[i][0]])
                
                if (line.rows[0].stock_produto == 0) {
                    throw new Error('Produto sem estoque')
                }

                //vai buscar todos o produto com o id recebido
                line = await pool.query('select * from produtos where produto_id=$1',[cart[i][0]])
                
                    if(line.rows[0] === undefined){
                        
                        return res.status(200).json({response: "produto nao existe"})  
                    }
                    
                    else{

                        //vai buscar o preço dos produtos
                        let line3= await pool.query('select preco from produtos where produto_id=$1',[cart[i][0]])
                        preco_total =preco_total + (parseInt(line3.rows[0].preco) * cart[i][1])

                        //guarda a maior versao ja dada na versao atualiza para uma nova inserçao
                        let line2= await pool.query('select MAX(version) from versao_produto where produtos_produto_id=$1',[cart[i][0]])
                        
                        if(line2.rows[0] === undefined){
                            version = 1
                            
                        }    
                        else{
                            
                            version = 1 + parseInt(line2.rows[0].max) 
                        }    
                        //guarda a data de hoje
                        let date = new Date()
                        const dia = date.getDate()
                        const mes = date.getMonth() + 1
                        const ano = date.getFullYear()
                        const data = dia.toString() + '-' + mes.toString() + '-' + ano.toString()
                        
                        //insere a compra no carrinho e guarda a versao do produto
                        await pool.query('INSERT INTO versao_produto(nome,preco,stock,version,descricao,creation_date,produtos_produto_id) VALUES($1,$2,$3,$4,$5,$6,$7)',[line.rows[0].nome,line.rows[0].preco,line.rows[0].stock_produto,version,line.rows[0].descricao,data,cart[i][0]])
                        await pool.query('insert into cart(quantidade,produtos_produto_id,comprador_users_username) values ($1,$2,$3)',[cart[i][1],cart[i][0],tokeninfo.username])
                        await pool.query('DELETE FROM subscricoes WHERE comprador_users_username = $1 AND cupao_id_cupao = $2', [tokeninfo.username,cupao_id])
                    }
                                    
                
                await pool.query('update produtos set stock_produto = stock_produto - $1 where produto_id = $2;',[cart[i][1],cart[i][0]])
                

            }
            await pool.query('COMMIT')
            
          } catch (e) {
            await pool.query('ROLLBACK')
             console.log(e)
          } finally{
              return res.status(200).json({"status":"ok"})
          }
        
    },

    criar_novo_produto: async (req, res) => {
        const type = req.body.type
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
            throw(error)
        }
        if (line.rows[0] === undefined){
            return res.status(401).send()
        }
        console.log(line)  
        try {     
            
            let max_prod= await pool.query('select MAX(produto_id) from produtos')
            if (max_prod.rows[0].max === null){
                produto_id=1
            }
            else{
                produto_id=parseInt(max_prod.rows[0].max)+1
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
                await pool.query('INSERT INTO produtos (produto_id,nome,preco, descricao,stock_produto,empresas_empresa_id) VALUES ($1, $2, $3, $4,$5,$6)', [produto_id, nome, preco, descricao,stock,empresa_id])
                    
                await pool.query('INSERT INTO smartphones(marca,produtos_produto_id) VALUES($1,$2)', [marca, produto_id])
                        
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
            await pool.query('INSERT INTO produtos (produto_id,nome,preco, descricao,stock_produto,empresas_empresa_id) VALUES ($1, $2, $3, $4,$5,$6)',// insere produto
            [produto_id, nome, preco, descricao,stock,empresa_id])
                
            await pool.query('INSERT INTO computadores(cpu,produtos_produto_id) VALUES($1,$2)', [cpu, produto_id])// insere nos computadores
                    
            return res.status(200).send({ response: "produto criado" })
             
            } catch (error) {
                throw error
            }
        }
        else{
           
            return res.status(500).json({ response: "tipo de produto nao existe" })
        }
        
    },  
    update_product:async (req, res) =>{
        const produto_id = req.param.produto_id
        console.log(produto_id)
        const nome = req.body.nome
        const descricao = req.body.descricao
        const preco = req.body.preco
        const stock = req.body.stock
        const tokenheader = req.headers.authorization 
        var version
        tokeninfo = jwt.verify(tokenheader, '123456')
        
        let line
        try {
            line = await pool.query('SELECT users_username FROM administrador WHERE users_username = $1',[tokeninfo.username])// verifica se o utilizador é administrador
            
        } catch (error) {
            throw(error)
        }
        if (line.rows[0] === undefined){
            return res.status(401).send()
        }
      
        try {      
            let result= await pool.query('SELECT produto_id FROM produtos WHERE produto_id= $1 ', [produto_id] )// verifica se o produto existe
         
            if (result.rows[0] === undefined) {  
                return res.status(200).json({ response: "produto nao existente" })
            }
        } catch (error) {
            throw(error)
        }
        try {
            let line2= await pool.query('select MAX(version) from versao_produto where produtos_produto_id=$1',[produto_id])// verifica a versao maxima do produto
            
            
            if(line2.rows[0].max === null){//se nao tem versao da-lhe a versao 1 
                version = 1
                
            }    
            else{//se tiver versao acrescenta 1 a versao anterior
                
                version = 1 + parseInt(line2.rows[0].max) 
                console.log(version)
            }    
            let date = new Date()
            const dia = date.getDate()
            const mes = date.getMonth() + 1
            const ano = date.getFullYear()
    
            const data = dia.toString() + '-' + mes.toString() + '-' + ano.toString()
            
            
            
            let produto= await pool.query('select *from produtos where produto_id=$1', [produto_id])// vai buscar os dados do produto 
            
            await pool.query('INSERT INTO versao_produto(nome,preco,stock,version,descricao,creation_date,produtos_produto_id) VALUES($1,$2,$3,$4,$5,$6,$7)', //insere os dados nao atulaizados na versao_produto
            [produto.rows[0].nome,parseInt(produto.rows[0].preco),parseInt(produto.rows[0].stock_produto),version,produto.rows[0].descricao,data,produto_id])
            
            await pool.query('UPDATE produtos SET nome=$1,preco=$2,descricao=$3,stock_produto=$4 WHERE produto_id=$5', [nome,preco,descricao,stock,produto_id])// da update ao produto
            return res.status(200).json({ response: "produto atualizado" })
        } catch (error) {
            throw error
        }
    }
}
