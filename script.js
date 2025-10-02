const promptText = `// Prompt: Fetch top tip comments for the current project (Websim)
// This snippet returns the top tip comments (sorted by best) and their tip amounts.
(async () => {
  // get current project
  const project = await window.websim.getCurrentProject();
  const projectId = project.id;

  // fetch only tip comments, sort by best (server supports only_tips=true)
  const resp = await fetch(\`/api/v1/projects/\${projectId}/comments?only_tips=true&sort_by=best&first=20\`);
  if (!resp.ok) throw new Error('Failed to fetch comments: ' + resp.status);
  const data = await resp.json();

  // data.comments.data is an array of { comment, cursor }
  const topTips = data.comments.data
    .map(item => item.comment)
    .filter(c => c && c.card_data && c.card_data.type === 'tip_comment')
    .map(c => ({
      id: c.id,
      author: c.author?.username || c.author?.display_name || 'unknown',
      raw: c.raw_content,
      credits_spent: c.card_data?.credits_spent || 0,
      created_at: c.created_at
    }))
    .sort((a,b) => b.credits_spent - a.credits_spent); // ensure descending by tip amount

  // return or log the results
  console.log('Top tip comments', topTips);
  return topTips;
})();`;

const ta = document.getElementById('prompt');
ta.value = promptText;

document.getElementById('copyBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(ta.value);
    document.getElementById('status').textContent = 'Copied.';
    setTimeout(()=>document.getElementById('status').textContent='',1500);
  } catch (e) {
    document.getElementById('status').textContent = 'Copy failed';
  }
});

