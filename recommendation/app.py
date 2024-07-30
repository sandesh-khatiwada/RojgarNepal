#Basic imports
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer 
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine
from flask import Flask, request, jsonify
from sqlConnect import connection_url

app = Flask(__name__)

def recommendation(job_id, location, serviceType, top_n=5):
    # SQL queries
    query_services = f"SELECT sid, description FROM Services WHERE location LIKE '%{location}%' AND serviceType LIKE '%{serviceType}%';"
    query_jobs = "SELECT job_id, description FROM Jobs;"

    engine = create_engine(connection_url)

    # Get latest Data
    df_jobs = pd.read_sql(query_jobs, engine).drop_duplicates()
    df_services = pd.read_sql(query_services, engine).drop_duplicates()

    if df_jobs.empty or df_services.empty:
        raise ValueError("No data found for jobs or services")

    # TF-IDF stop words as english
    tfidf = TfidfVectorizer(stop_words='english')

    df_jobs['description'] = df_jobs['description'].fillna("")
    df_services['description'] = df_services['description'].fillna("")

    combined_text = pd.concat([df_jobs['description'], df_services['description']])
    if combined_text.empty:
        raise ValueError("Combined text for TF-IDF is empty")

    tfidf_matrix = tfidf.fit_transform(combined_text)  # Vectorize text data using TF-IDF

    # Splitting TF-IDF matrix into job descriptions and service description
    tfidf_matrix_jobs = tfidf_matrix[:len(df_jobs)]
    tfidf_matrix_services = tfidf_matrix[len(df_jobs):]

    # Ensure matrices are not empty
    if tfidf_matrix_jobs.shape[0] == 0 or tfidf_matrix_services.shape[0] == 0:
        raise ValueError("TF-IDF matrices are empty")

    # Computing Cosine Similarity
    cosine_similarity_matrix = cosine_similarity(tfidf_matrix_jobs, tfidf_matrix_services)

    # Find the index of the job in the DataFrame
    job_index = df_jobs[df_jobs['job_id'] == job_id].index[0]
    # Get the top N recommendations for this job
    top_indices = np.argsort(cosine_similarity_matrix[job_index])[::-1][:top_n]
    recommended_contractors = df_services.iloc[top_indices]['sid'].values
    return recommended_contractors

@app.route('/recommendations/<int:job_id>', methods=['GET'])
def recommendation_route(job_id):
    location = request.args.get('location')
    serviceType = request.args.get('serviceType')
    if not location or not serviceType:
        return jsonify({'error': 'Missing required query parameters: location and serviceType'}), 400
    
    try:
        recommended_contractors = recommendation(job_id, location, serviceType)
        return jsonify({
            'job_id': job_id,
            'recommended_contractors': recommended_contractors.tolist()
        })
    except IndexError:
        return jsonify({'error': 'Job ID not found'}), 404
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
