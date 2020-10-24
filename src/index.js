export default (name) => {
  if (!name) throw new Error('Name is required');
  const helloMessage = 'Hello,';
  return `${helloMessage} ${name}!`;
};
