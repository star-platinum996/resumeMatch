/**
 * 正则匹配工具类
 * 涵盖日常开发高频场景，支持验证和提取匹配结果
 */
export class RegexUtils {
    // -------------------------- 基础场景 --------------------------
    /**
     * 验证手机号（中国大陆，支持13/14/15/17/18/19开头）
     * @param phone 待验证手机号
     * @returns 匹配结果（true/false）
     */
    static isPhone(phone: string): boolean {
        const reg = /^1[3-9]\d{9}$/;
        return reg.test(phone);
    }

    /**
     * 验证邮箱（标准格式，支持字母、数字、下划线及域名后缀）
     * @param email 待验证邮箱
     * @returns 匹配结果（true/false）
     */
    static isEmail(email: string): boolean {
        const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        return reg.test(email);
    }

    /**
     * 验证身份证号（18位，支持最后一位为X）
     * @param idCard 待验证身份证号
     * @returns 匹配结果（true/false）
     */
    static isIdCard(idCard: string): boolean {
        const reg = /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        return reg.test(idCard);
    }

    // -------------------------- 格式验证 --------------------------
    /**
     * 验证URL（支持http/https/ftp协议）
     * @param url 待验证URL
     * @returns 匹配结果（true/false）
     */
    static isUrl(url: string): boolean {
        const reg = /^(https?:\/\/|ftp:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
        return reg.test(url);
    }

    /**
     * 验证密码强度（至少8位，包含字母+数字+特殊符号）
     * @param password 待验证密码
     * @returns 匹配结果（true/false）
     */
    static isStrongPassword(password: string): boolean {
        const reg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,}$/;
        return reg.test(password);
    }

    /**
     * 验证纯中文（仅包含中文字符，不含空格和符号）
     * @param chinese 待验证中文
     * @returns 匹配结果（true/false）
     */
    static isChinese(chinese: string): boolean {
        const reg = /^[\u4e00-\u9fa5]+$/;
        return reg.test(chinese);
    }

    // -------------------------- 结果提取 --------------------------
    /**
     * 提取文本中的所有手机号
     * @param text 待处理文本
     * @returns 手机号数组（无匹配则返回空数组）
     */
    static extractPhones(text: string): string[] {
        const reg = /1[3-9]\d{9}/g;
        return text.match(reg) || [];
    }

    /**
     * 提取文本中的所有邮箱
     * @param text 待处理文本
     * @returns 邮箱数组（无匹配则返回空数组）
     */
    static extractEmails(text: string): string[] {
        const reg = /[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+/g;
        return text.match(reg) || [];
    }

    /**
     * 提取文本中的所有URL
     * @param text 待处理文本
     * @returns URL数组（无匹配则返回空数组）
     */
    static extractUrls(text: string): string[] {
        const reg = /(https?:\/\/|ftp:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?/g;
        return text.match(reg) || [];
    }

    // -------------------------- 自定义匹配 --------------------------
    /**
     * 自定义正则匹配
     * @param text 待处理文本
     * @param regex 正则表达式（支持字符串或RegExp对象）
     * @param flags 正则标志（如g/i/m，仅当regex为字符串时生效）
     * @returns 匹配结果（test返回boolean，match返回数组）
     */
    static customMatch(
        text: string,
        regex: string | RegExp,
        type: 'test' | 'match' = 'test',
        flags?: string
    ): boolean | string[] {
        const reg = typeof regex === 'string' ? new RegExp(regex, flags) : regex;
        return type === 'test' ? reg.test(text) : text.match(reg) || [];
    }
}