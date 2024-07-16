// eslint-disable-next-line import/prefer-default-export
export const getAddresses = (str: string): string[] => {
    try {
        return JSON.parse(str);
    } catch {
        if (str.includes(',')) {
            return str
                .split(',')
                .map((t) => t.trim())
                .filter((a) => a);
        }
        if (/\n/.exec(str)?.length) {
            return str
                .split('\n')
                .map((t) => t.trim())
                .filter((a) => a);
        }
        if (/\r/.exec(str)?.length) {
            return str
                .split('\r')
                .map((t) => t.trim())
                .filter((a) => a);
        }
        return [str];
    }
};
