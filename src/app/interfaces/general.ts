export interface IEncryptedData {
    iv: string,
    content: string,
    tag: string,
    key: string
}