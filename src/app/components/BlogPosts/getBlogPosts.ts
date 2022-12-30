import 'server-only'

const query = `
  query {
    user(username: "nahtnam") {
      publication {
        posts(page: 0) {
          title
          slug
          brief
        }
      }
    }
  }
`

type Response = {
  title: string;
  slug: string;
  brief: string
}

export async function getBlogPosts() {
  const req = await fetch('https://api.hashnode.com/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          query,
          variables: {}
      })
  });

  if (!req.ok) {
    throw new Error('Failed to fetch data');
  }

  const res = await req.json();
  return res.data.user.publication.posts as Array<Response>;
}
