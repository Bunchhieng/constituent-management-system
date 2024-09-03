export const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (token === '1234567890') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};