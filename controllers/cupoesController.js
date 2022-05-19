const express = require("express");
const jwt = require('jsonwebtoken');
const { mutateExecOptions } = require("nodemon/lib/config/load");
const { postgresMd5PasswordHash } = require("pg/lib/utils");
const pool  = require("../connection")

module.exports = {
    createCampanha: async(req, res)=>{
        const description= req.body.description
        const start = req.body.date_start
        const end = req.body.date_end
        const stock = parseInt(req.body.cupons)
        const produto_id = parseInt(req.body.produto_id)
        const desconto = parseInt(req.body.discount)
        const validade = parseInt(req.body.validade)
        const tokenheader = req.headers.authorization
        
        tokeninfo = jwt.verify(tokenheader, '123456')
        
        try{
        //verifica se o usuario e admin
            let result =await pool.query('SELECT users_username FROM administrador where users_username = $1',[tokeninfo.username])
            if(result.rows[0] === undefined){
                return res.status(500).send({resultado: "user is not admin"})
            }

            //inserir a campanha
            result = await pool.query('INSERT INTO campanha (inicio, fim, description, stock, produtos_produto_id, administrador_users_username) VALUES($1,$2,$3,$4,$5,$6) RETURNING (campanha_id)',
                [start, end, description, stock, produto_id, tokeninfo.username])
            console.log("campanha_id")
            //inserir o cupao
            await pool.query('INSERT INTO cupao (campanha_campanha_id, desconto, validade) VALUES ($1, $2, $3)', [id_campanha, desconto, validade])

            pool.query("COMMIT")

            return res.status(200).send({resultado: "campanha created"})        
        }
        catch (e){
            
            throw e
        }
   
    },

    subscribe: async(req, res)=>{

        const id = parseInt(req.params.campanha_id)
        
        //recebe a data de hoje
        let date = new Date()
        const dia = date.getDate()
        const mes = date.getMonth() + 1
        const ano = date.getFullYear()

        const data = dia.toString() + '-' + mes.toString() + '-' + ano.toString()
        
        var posicao = 0
        const tokenheader = req.headers.authorization
        tokeninfo = jwt.verify(tokenheader, '123456')

 
        //procura o nome do user do token na tabela de compradores para ver se é um comprador
        try {
            line = await pool.query('SELECT users_username FROM comprador WHERE users_username = $1',[tokeninfo.username])
            
        } catch (error) {
            throw(error)
        }
        if (line.rows[0] === undefined){
            return res.status(401).json({response: "nao autorizado"})
        }

        
         
        try{
            
            
            let cupao_id = await pool.query('SELECT id_cupao from cupao where campanha_campanha_id = $1', [id])
            //recebe os id e stock 
            let result = await pool.query('SELECT inicio,stock FROM campanha')
            
            // if(parseInt(ano) > parseInt(fim[2]) || parseInt(mes) > parseInt(fim[1]) && parseInt(ano) <= parseInt(fim[2])|| parseInt(dia) > parseInt(fim[0]) && parseInt(mes) == parseInt(fim[1]) && parseInt(ano) == parseInt(fim[2])){
            //    await pool.query('DELETE FROM campanha where campanha_id = $1', [cam_id])
            // }
            if(cupao_id.rows[0] == undefined){
                return res.status(401).send({resultado:"campanha nao existe"})
            }
            //se o stock for 0 nao faz nada 
            if(parseInt(result.rows[0].stock) == 0){
                return res.status(401).send({result: "ja nao ha mais cupoes"})
            }
            
            result = await pool.query('SELECT posicao from subscricoes where cupao_id_cupao = $1 AND comprador_users_username = $2',[cupao_id.rows[0].id_cupao, tokeninfo.username])
            if(result.rows[0] != undefined){
                return res.status(401).send({result: "utilizado ja esta inscrito nesta campanha"})
            }
            result = await pool.query('SELECT campanha_id FROM campanha')

            if(result.rows[0] != undefined){
                //verifica o valor da ultima posicao
                result = await pool.query('SELECT MAX(posicao) FROM subscricoes') 

                
                if(result.rows[0].max === null){
                    posicao = 1
                }
                else{
                    posicao = 1 + parseInt(result.rows[0].max)
                }
                
                
                //insere a subscricao
                await pool.query('INSERT INTO subscricoes (posicao, comprador_users_username, cupao_id_cupao, data_inscricao) VALUES ($1, $2, $3, $4)', 
                [posicao,tokeninfo.username , parseInt(cupao_id.rows[0].id_cupao),data])
                
                
                
                //atualiza o stock
                await pool.query('UPDATE campanha SET stock = $1 where campanha_id = $2',[stock-1, id])
                
                return res.status(200).json({resultado: 'subscricao feita com sucesso'})
            }

            
            return res.status(200).send({resultado: 'nao existe essa campanha'})
        }
        catch(e){
            throw e
        }
    }
}