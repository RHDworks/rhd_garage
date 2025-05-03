export const getColorStatus = (status:string) => {
    switch (status.toLowerCase()) {
        case 'in garage':
            return 'green';
        case 'out':
            return 'red';
        case 'impounded':
            return 'yellow';
        default:
            return 'blue';
    }
}

export const getColorProgress = (val:number) => {
    if (val > 75) {
        return 'green'
    } else if (val > 35) {
        return 'orange'
    } else {
        return 'red'
    }
}