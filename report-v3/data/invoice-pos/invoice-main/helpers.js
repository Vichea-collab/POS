function subtotal(unit_price,qty){
    return riel(unit_price * qty);
}

function addOne(index){
    return Number(index || 0) + 1;
}

function riel(value){
    return `${Math.round(Number(value || 0)).toLocaleString()}៛`;
}

function formatDate(value){
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value || '';
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
