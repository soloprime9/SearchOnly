import {isToday, format, formatDistanceToNow, isYesterday } from 'date-fns';


export function formatPostTime(timestamp){
    const date = new Date(timestamp);

    if(isToday(date)){
        return format(date, 'p'); // Ex. 2:39 AM
    
    }

    else if(isYesterday(date)){
        return 'Yesterday';
    }

    else if(formatDistanceToNow(date, {addSuffix: true}).includes('day')){
        return format(date, 'MMM d'); // Ex. April 23
    }

    else{
        return formatDistanceToNow(date, {addSuffix: true}); // Ex. 20 minutes Ago
    }
}
