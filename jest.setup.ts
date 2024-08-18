

const start = async () => {
    process.env.PGPORT = '54322';
    // (global as any).__TEST_SERVER__ = app;
}

export default async () => start();