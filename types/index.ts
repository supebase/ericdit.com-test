export namespace User {
  export interface Profile {
    id: string;
    first_name: string;
    email: string;
    avatar: string;
    location: string;
  }

  export interface Status {
    id: string;
    user_created: User.Profile;
    status: boolean;
    last_activity_at: string | null;
  }
}

export namespace Contents {
  export interface Item {
    id: string;
    title: string;
    body: string;
    allow_comment: boolean;
    images: any[];
    date_created: string;
    date_updated: string;
  }

  export interface QueryOptions {
    fields: string[];
    sort?: string[];
    filter?: Record<string, any>;
  }
}

export namespace Comments {
  export interface Item {
    id: string;
    user_created: User.Profile;
    date_created: string;
    comment: string;
    content_id: string;
    parent_comment_id?: string | null;
  }

  export interface QueryOptions {
    fields: string[];
    sort?: string[];
    filter?: Record<string, any>;
  }
}

export namespace Likes {
  export interface Item {
    id: string;
    user_created: User.Profile;
    content_id: string;
    comment_id?: string | null;
  }

  export interface QueryOptions {
    fields: string[];
    sort?: string[];
    filter?: Record<string, any>;
  }
}

export namespace Bookmarks {
  export interface Item {
    id: string;
    user_created: User.Profile;
    date_created: string;
    content_id: string;
  }

  export interface QueryOptions {
    fields: string[];
    sort?: string[];
    filter?: Record<string, any>;
  }
}
