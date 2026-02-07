/**
 * 日付フォーマットユーティリティ
 * スラッシュ形式で日付を表示
 */

/**
 * 年を下2桁で取得
 */
function getShortYear(date: Date): string {
    return String(date.getFullYear()).slice(-2);
}

/**
 * 日付をスラッシュ形式（年/月/日）でフォーマット
 * 例: "26/1/11"
 */
export function formatDateJapanese(date: Date): string {
    return `${getShortYear(date)}/${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 日付と時間をスラッシュ形式でフォーマット（詳細画面用）
 * 例: "26/1/11 15:30"
 */
export function formatDateTimeJapanese(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${getShortYear(date)}/${date.getMonth() + 1}/${date.getDate()} ${hours}:${minutes}`;
}

