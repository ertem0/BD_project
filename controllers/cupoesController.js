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
        
        var id_campanha = 0
        var id_cupao = 0
        tokeninfo = jwt.verify(tokenheader, '123456')
        
        try{
            await pool.query('BEGIN')

            //verifica se o usuario e admin
            let result =await pool.query('SELECT users_username FROM administrador where users_username = $1',[tokeninfo.username])
            if(result.rows[0] === undefined){
                return res.status(500).send({resultado: "user is not admin"})
            }

            result = await pool.query('SELECT inicio, fim FROM campanha')
            //verificar se as datas das campanhas criadas nao ficam uma em cima das outras
            for(const i in result.rows){
                const inicio = result.rows[i].inicio.split("-")
                const fim = result.rows[i].fim.split("-")
                

            } 
                //se da data for igual ou maior que o inicio soma a condicao
                if(((parseInt(dia)<= parseInt(fim[0]) ||parseInt(dia)> parseInt(fim[0])) && parseInt(mes) >= parseInt(inicio[1]) && parseInt(inicio[2]) == parseInt(ano)) || (parseInt(ano) > parseInt(inicio[2]))){
                    cond+=1
                    
                }
                //se a data for menor ou igual que o inicio soma a condicao
                if(( (parseInt(dia)<= parseInt(fim[0]) ||parseInt(dia)> parseInt(fim[0]))&&  parseInt(mes)<= parseInt(fim[1]) && parseInt(fim[2]) == parseInt(ano)) || parseInt(ano) < parseInt(fim[2])){
                    cond+=1
                    
                }



            //buscar o id da ultima campanha
            result = await pool.query('SELECT MAX(campanha_id) FROM campanha') 
                
            if(result.rows[0].max === null){
                id_campanha = 1
            }
            else{
                id_campanha = 1 + parseInt(result.rows[0].max)
            }
            //inserir a campanha
            await pool.query('INSERT INTO campanha (campanha_id, inicio, fim, description, stock, produtos_produto_id, administrador_users_username) VALUES($1,$2,$3,$4,$5,$6,$7)',
                [id_campanha, start, end, description, stock, produto_id, tokeninfo.username])
            //buscar o id do ultimo cupao
            result = await pool.query('SELECT MAX(id_cupao) FROM cupao') 

            if(result.rows[0].max === null){
                id_cupao = 1
            }
            else{
                id_cupao = 1 + parseInt(result.rows[0].max)
            }
            //inserir o cupao
            await pool.query('INSERT INTO cupao (campanha_campanha_id, desconto, id_cupao, validade) VALUES ($1, $2, $3, $4)', [id_campanha, desconto, id_cupao, validade])
            pool.query("COMMIT")

            return res.status(200).send({resultado: "campanha created"})
            
        }
        catch (e){
            pool.query('ROLLBACK')
            throw e
        }
        

        
    },

    subscribe: async(req, res)=>{
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
            //recebe os dados de inicio e fim da campanha juntamente com o id e stock de cada
            let result = await pool.query('SELECT inicio, fim, campanha_id , stock FROM campanha')
            for (const i in result.rows) {
                var cond = 0
                const inicio = result.rows[i].inicio.split('-')
                const fim = result.rows[i].fim.split('-')
                const cam_id = parseInt(result.rows[i].campanha_id)
                const stock = parseInt(result.rows[i].stock)
                

                // if(parseInt(ano) > parseInt(fim[2]) || parseInt(mes) > parseInt(fim[1]) && parseInt(ano) <= parseInt(fim[2])|| parseInt(dia) > parseInt(fim[0]) && parseInt(mes) == parseInt(fim[1]) && parseInt(ano) == parseInt(fim[2])){
                //    await pool.query('DELETE FROM campanha where campanha_id = $1', [cam_id])
                // }

                //se o stock for 0 nao faz nada 
                if (stock == 0){
                    return res.status(400).send({resultado: 'campanha is full'})
                }
                //se da data for igual ou maior que o inicio soma a condicao
                if(((parseInt(dia)<= parseInt(fim[0]) ||parseInt(dia)> parseInt(fim[0])) && parseInt(mes) >= parseInt(inicio[1]) && parseInt(inicio[2]) == parseInt(ano)) || (parseInt(ano) > parseInt(inicio[2]))){
                    cond+=1
                    
                }
                //se a data for menor ou igual que o inicio soma a condicao
                if(( (parseInt(dia)<= parseInt(fim[0]) ||parseInt(dia)> parseInt(fim[0]))&&  parseInt(mes)<= parseInt(fim[1]) && parseInt(fim[2]) == parseInt(ano)) || parseInt(ano) < parseInt(fim[2])){
                    cond+=1
                    
                }
                //se a condicao for 2 aplica a subscricao
                if(cond == 2){
                    //verifica o valor da ultima posicao
                    result = await pool.query('SELECT MAX(posicao) FROM subscricoes') 

                    //vai buscar o id do cupao da campanha
                    let cupao_id = await pool.query('SELECT id_cupao from cupao where campanha_campanha_id = $1', [cam_id])
                    
                    if(result.rows[0].max === null){
                        posicao = 1
                    }
                    else{
                        posicao = 1 + parseInt(result.rows[0].max)
                    }

                    console.log(posicao, tokeninfo.username, parseInt(cupao_id.rows[0].id_cupao) , data)
                    //insere a subscricao
                    await pool.query('INSERT INTO subscricoes (posicao, comprador_users_username, cupao_id_cupao, data_inscricao) VALUES ($1, $2, $3, $4)', 
                    [posicao,tokeninfo.username , parseInt(cupao_id.rows[0].id_cupao),data])

                    

                    //atualiza o stock
                    await pool.query('UPDATE campanha SET stock = $1 where campanha_id = $2',[stock-1, cam_id])
                    
                    return res.status(200).json({resultado: 'subscricao feita com sucesso'})
                }
                
                
            }
            
            return res.status(200).send({resultado: 'nao ha cupoes na data de agora'})
        }
        catch(e){
            throw e
        }
    }
}