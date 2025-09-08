export function makeReplyQuotePlain(fromEmail: string, dateISO: string, originalBody: string) {
    const d = new Date(dateISO || Date.now());
    const datePart = d.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    const timePart = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  
    const header = `On ${datePart} at ${timePart} ${fromEmail} wrote:`;
  
    const quoted = (originalBody || '')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map(line => `> ${line}`)       // nested quoting becomes >>, >>>, etc.
      .join('\r\n');
  
    return `${header}\r\n${quoted}`;
}