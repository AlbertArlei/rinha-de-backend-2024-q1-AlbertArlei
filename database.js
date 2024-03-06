import pg from "pg"

const pool = new pg.Pool({
    connectionString: 'postgres://admin:123@db:5432/rinha',
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 100000,
});

export async function transacao(data) {
    const client = await pool.connect();
    const query = 'SELECT calcular_saldo($1, $2, $3, $4, $5) AS result';
    const response = (await client.query(query, data)).rows;
    client.release();
    return response;
}

    export async function extrato(cliente_id) {
        const client = await pool.connect();
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock($1)', [cliente_id]);
        const query = 'SELECT saldo, valor, tipo, descricao, realizada_em FROM transacoes WHERE cliente_id = $1 ORDER BY realizada_em DESC LIMIT 10';
        const response = (await client.query(query, [cliente_id])).rows;
        await client.query('END;');
        client.release();
        return response;
    }