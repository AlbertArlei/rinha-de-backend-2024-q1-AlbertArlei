import express from "express";
import { extrato, transacao } from "./database.js";

const app = express();
app.use(express.json())

app.get("/clientes/:id/extrato", async (req, res) => {
    const id = req.params.id;
    if (id > 0 && id < 6) {
        const limite = [100000, 80000, 1000000, 10000000, 500000];
        const newExtrato = await extrato(id);

        const newExtratoNoSaldo = ((extrato) => {
            const extratoData = [];
            extrato.forEach(element => {
                extratoData.push({
                    valor: parseFloat(element.valor),
                    tipo: element.tipo,
                    descricao: element.descricao,
                    realizada_em: element.realizada_em
                });
            });
            return extratoData;
        })(newExtrato);
        
        const extratoData = {
            saldo: {
                total: newExtrato[0] ? parseFloat(newExtrato[0].saldo) : 0,
                data_extrato: new Date().toISOString(),
                limite: limite[id - 1]
            },
            ultimas_transacoes: newExtratoNoSaldo
        }
        return res.status(200).json(extratoData)
    }
    return res.status(404).end();
});

app.post("/clientes/:id/transacoes", async (req, res) => {
    const id = req.params.id;
    if (id > 0 && id < 6) {
        const data = req.body;
        const descr = data.descricao;
        if (!Number.isInteger(data.valor)) return res.status(400).end();
        if (descr === null || descr === undefined) return res.status(400).end();
        if (descr.length < 1 || descr.length > 10) return res.status(400).end();
        const limite = [100000, 80000, 1000000, 10000000, 500000];
        const newTransacao = await transacao([id, data.tipo, data.valor, descr, limite[id - 1]]);
        const response = newTransacao[0].result;
        switch (response.code) {
            case 400:
                return res.status(response.code).end();
            case 422:
                return res.status(response.code).end();
            default:
                return res.status(response.code).json({ limite: response.limite, saldo: response.saldo });
        }
    }
    return res.status(404).end();
});

app.listen(8080, console.log("server is running..."));
