import bcrypt from 'bcrypt';

export async function hash(stringValue: string): Promise<string> {
    const hash: string = await bcrypt.hash(stringValue, 10);

    return hash;
}

export async function compare(stringValue: string, hashedValue: string): Promise<boolean> {
    const result: boolean = await bcrypt.compare(stringValue, hashedValue);

    return result;
}
