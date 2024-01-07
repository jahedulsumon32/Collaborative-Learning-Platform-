// api.js

async function fetchData(text) {
  const options = {
    method: 'POST',
    url: 'https://text-analysis12.p.rapidapi.com/summarize-text/api/v1.1',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': 'ab2f77f9cfmshaef089c6f33afd2p1225abjsn3969ad40952f',
      'X-RapidAPI-Host': 'text-analysis12.p.rapidapi.com'
    },
    data: {
      language: 'english',
      summary_percent: 10,
      text: text,
    },
  };

  try {
    const response = await axios(options);
    const summarizedText = response.data.summary;
    console.log('Summarized Text:', summarizedText);
    return summarizedText;
  } catch (error) {
    console.error(error);
  }
}
