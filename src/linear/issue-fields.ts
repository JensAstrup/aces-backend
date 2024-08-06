export const issueFields = `id
          title
          description
          url
          createdAt
          creator {
            id
            name
            displayName
          }
          team {
            id
            name
          }
          state {
            name
            type
            }
            comments {
                nodes {
                    id
                    body
                    createdAt
                    user {
                      id
                      name
                      avatarUrl
                    }
                    botActor {
                        id
                    }
                }
            }`
